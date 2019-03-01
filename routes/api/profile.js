const express = require("express");
const passport = require("passport");

const Profile = require("../../models/Profile");
// const User = require("../../models/User");

const validateProfileInput = require("../../validator/profile");

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ msg: "Profile router works" });
});

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          errors.noProfile = "There is no profile";
          return res.status(404).send(errors);
        }

        res.json(profile);
      })
      .catch(err => res.status(404).send(err));
  }
);

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    if (!isValid) res.status(400).send(errors);

    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    if (typeof req.body.skills !== undefined)
      profileFields.skills = req.body.skills.split(",");

    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (profile) {
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true }
          )
            .then(updatedProfile => res.json(updatedProfile))
            .catch(err => res.status(500).json(err));
        } else {
          Profile.findOne({ handle: req.body.handle })
            .then(profile => {
              if (profile && profile.user != req.user.id) {
                errors.handle = "That handle already exist";
                res.status(400).send(errors);
              }

              new Profile(profileFields)
                .save()
                .then(newProfile => {
                  res.json(newProfile);
                })
                .catch(err => res.status(500).send(err));
            })
            .catch(err => res.status(500).send(err));
        }
      })
      .catch(err => res.status(500).send(err));
  }
);

module.exports = router;
