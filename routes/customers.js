var express = require("express");
var router = express.Router();
var http = require("http");
var fs = require("fs");
var fileUpload = require('express-fileupload');
var path = require('path');
var formidable = require("formidable");
const check = require('express-validator/check').check;
const validationResult = require('express-validator/check').validationResult;
var mv = require("mv");
var authentication_mdl = require("../middlewares/authentication");
var session_store;
var query
/* GET Customer page. */

router.get("/", authentication_mdl.is_login ,function (req, res, next) {
  req.getConnection(function (err, connection) {
    query = connection.query(
      "SELECT * FROM tb_profil",
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("dashboard/utama", {
          title: "Customers",
          data: rows,
          session_store: req.session,
        });
      }
    );
    //console.log(query.sql);
  });
});

router.get("/pegawai", authentication_mdl.is_login, function (req, res, next) {
  req.getConnection(function (err, connection) {
    query = connection.query(
      "SELECT * FROM tb_pegawai",
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("customer/list", {
          title: "Customers",
          data: rows,
          session_store: req.session,
        });
      }
    );
    //console.log(query.sql);
  });
});

router.delete(
  "/delete/(:id)", authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var customer = {
        id: req.params.id,
      };

      var delete_sql = "delete from tb_pegawai where ?";
      req.getConnection(function (err, connection) {
        var query = connection.query(
          delete_sql,
          customer,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Delete : %s ", err);
              req.flash("msg_error", errors_detail);
              res.redirect("/customers/pegawai");
            } else {
              req.flash("msg_info", "Delete Customer Success");
              res.redirect("/customers/pegawai");
            }
          }
        );
      });
    });
  }
);
router.get(
  "/edit/(:id)", authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var query = connection.query(
        "SELECT * FROM tb_pegawai where id=" + req.params.id,
        function (err, rows) {
          if (err) {
            var errornya = ("Error Selecting : %s ", err);
            req.flash("msg_error", errors_detail);
            res.redirect("/customers/pegawai");
          } else {
            if (rows.length <= 0) {
              req.flash("msg_error", "Customer can't be find!");
              res.redirect("/customers/pegawai");
            } else {
              console.log(rows);
              res.render("customer/edit", {
                title: "Edit ",
                data: rows[0],
                session_store: req.session,
              });
            }
          }
        }
      );
    });
  }
);
router.put(
  "/edit/(:id)", authentication_mdl.is_login,
  function (req, res, next) {
    req.assert("nip", "Please fill the nip").notEmpty();
    var errors = req.validationErrors();
    if (!errors) {
      v_nip = req.sanitize("nip").escape().trim();
      v_nama = req.sanitize("nama").escape().trim();
      v_alamat = req.sanitize("alamat").escape().trim();
      v_no_hp = req.sanitize("no_hp").escape();
      v_status = req.sanitize("status").escape();
      v_jabatan = req.sanitize("jabatan").escape();

      if (!req.files) {
        var customer = {
          nip: v_nip,
          alamat: v_alamat,
          nama: v_nama,
          no_hp: v_no_hp,
          status: v_status,
          jabatan: v_jabatan,
        };
      } else {
        var file = req.files.gambar;
        file.mimetype == "image/jpeg" || "image/png";
        file.mv("public/images/" + file.name);

        var customer = {
          nip: v_nip,
          alamat: v_alamat,
          nama: v_nama,
          no_hp: v_no_hp,
          status: v_status,
          jabatan: v_jabatan,
          gambar: file.name,
        }
      };

      var update_sql = "update tb_pegawai SET ? where id = " + req.params.id;
      req.getConnection(function (err, connection) {
        var query = connection.query(
          update_sql,
          customer,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Update : %s ", err);
              req.flash("msg_error", errors_detail);
              res.render("customer/edit", {
                nip: req.param("nip"),
                alamat: req.param("alamat"),
                nama: req.param("nama"),
                no_hp: req.param("no_hp"),
                status: req.param("status"),
                jabatan: req.param("jabatan"),
                gambar: req.param("gambar"),
              });
            } else {
              req.flash("msg_info", "Update customer success");
              res.redirect("/customers/edit/" + req.params.id);
            }
          }
        );
      });
    } else {
      console.log(errors);
      errors_detail = "<p>Sory there are error</p><ul>";
      for (i in errors) {
        error = errors[i];
        errors_detail += "<li>" + error.msg + "</li>";
      }
      errors_detail += "</ul>";
      req.flash("msg_error", errors_detail);
      res.redirect("/customers/edit/" + req.params.id);
    }
  }
);

router.post("/add", authentication_mdl.is_login, function (req, res, next) {
  req.assert("nip", "Please fill the nip").notEmpty();
  var errors = req.validationErrors();
  if (!errors) {
    v_nip = req.sanitize("nip").escape().trim();
    v_nama = req.sanitize("nama").escape().trim();
    v_alamat = req.sanitize("alamat").escape().trim();
    v_no_hp = req.sanitize("no_hp").escape();
    v_status = req.sanitize("status").escape();
    v_jabatan = req.sanitize("jabatan").escape();

    var file = req.files.gambar;
    file.mimetype == "image/jpeg" || "image/png";
    file.mv("public/images/" + file.name);

    var customer = {
      nip: v_nip,
      alamat: v_alamat,
      nama: v_nama,
      no_hp: v_no_hp,
      status: v_status,
      jabatan: v_jabatan,
      gambar: file.name,
    };

    var insert_sql = "INSERT INTO tb_pegawai SET ?";
    req.getConnection(function (err, connection) {
      var query = connection.query(
        insert_sql,
        customer,
        function (err, result) {
          if (err) {
            var errors_detail = ("Error Insert : %s ", err);
            req.flash("msg_error", errors_detail);
            res.render("customer/add-customer", {
              nip: req.param("nip"),
              alamat: req.param("alamat"),
              nama: req.param("nama"),
              no_hp: req.param("no_hp"),
              status: req.param("status"),
              jabatan: req.param("jabatan"),
              gambar: req.param("gambar"),
              session_store: req.session,
            });
          } else {
            req.flash("msg_info", "Create customer success");
            res.redirect("/customers/pegawai");
          }
        }
      );
    });
  } else {
    console.log(errors);
    errors_detail = "<p>Sory there are error</p><ul>";
    for (i in errors) {
      error = errors[i];
      errors_detail += "<li>" + error.msg + "</li>";
    }
    errors_detail += "</ul>";
    req.flash("msg_error", errors_detail);
    res.render("customer/add-customer", {
      nip: req.param("nip"),
      alamat: req.param("alamat"),
      status: req.param("status"),
      jabatan: req.param("jabatan"),
      session_store: req.session,
    });
  }
});

router.get("/add", authentication_mdl.is_login, function (req, res, next) {
  res.render("customer/add-customer", {
    title: "Add New Customer",
    nip: "",
    nama: "",
    no_hp: "",
    alamat: "",
    status: "",
    jabatan: "",
    gambar: "",
    session_store: req.session,
  });
});

module.exports = router;