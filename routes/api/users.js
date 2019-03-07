const express = require("express");
const gravator = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const _ = require("lodash");

const config = require("../../config/config");
const User = require("../../models/User");

const router = express.Router();

const validateRegisterInput = require("../../validator/register");
const validateLoginInput = require("../../validator/login");

// @router GET /test
router.get("/test", (req, res) => {
  res.json({ msg: "User router works" });
});

// @router POST /register
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).send(errors);
  }

  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        return res.status(400).send({ email: "Email already exist" });
      } else {
        const avatar = gravator.url(req.body.email, {
          s: "200",
          r: "pg",
          d: "mm"
        });

        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar,
          password: req.body.password
        });

        console.log("avatar", avatar);

        bcrypt.hash(newUser.password, 10, (err, hash) => {
          if (err) throw err;

          newUser.password = hash;

          newUser
            .save()
            .then(user => res.json(_.pick(user, ["name", "email", "avatar"])))
            .catch(err => {
              console.log(err);
              res.status(500).send({ msg: "Failed to register" });
            });
        });
      }
    })
    .catch(err => {});
});

// @router POST /login

router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).send(errors);
  }

  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        errors.email = "User not found";
        return res.status(404).send({ errors });
      }

      bcrypt
        .compare(req.body.password, user.password)
        .then(isMatch => {
          if (isMatch) {
            let payload = {
              id: user.id,
              name: user.name,
              avatar: user.avatar
            };

            jwt.sign(
              payload,
              config.jwtSecret,
              { expiresIn: 3600 },
              (err, token) => {
                res.json({ successs: true, token: "Bearer " + token });
              }
            );
          } else {
            errors.password = "Password incorrect";
            res.status(400).send(errors);
          }
        })
        .catch(err => {
          console.log(err);
          res.status(500).send({ msg: "Internal Error" });
        });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({ msg: "Internal Error" });
    });
});

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json(_.pick(req.user, ["id", "name", "email", "avatar"]));
  }
);

module.exports = router;
