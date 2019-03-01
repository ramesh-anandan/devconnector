const express = require("express");
const passport = require("passport");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

const validateProfileInput = require("../../validator/profile");
const validateExperienceInput = require("../../validator/experience");
const validateEducationInput = require("../../validator/education");

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
      .populate("user", ["name", "avatar"])
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

router.get("/all", (req, res) => {
  const errors = {};

  Profile.find()
    .then(profiles => {
      if (!profiles) {
        errors.profiles = "There are no profiles";
        return res.status(404).send(errors);
      }

      res.json(profiles);
    })
    .catch(err =>
      res.status(404).send({ profileFields: "There are no profiles" })
    );
});

router.get("/handle/:handle", (req, res) => {
  const errors = {};

  const handle = req.params.handle;

  Profile.findOne({ handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noProfile = "No profile found";
        return res.status(404).send(errors);
      }

      res.json(profile);
    })
    .catch(err => res.status(404).send(err));
});

router.get("/user/:user_id", (req, res) => {
  const errors = {};

  const user = req.params.user_id;

  Profile.findOne({ user })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noProfile = "No profile found";
        return res.status(404).send(errors);
      }

      res.json(profile);
    })
    .catch(err =>
      res.status(404).send({ profile: "There is no profile for this user" })
    );
});

router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    if (!isValid) res.status(400).send(errors);

    console.log("user", req.user.id);

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const newExp = {};
        newExp.title = req.body.title;
        newExp.company = req.body.company;
        newExp.from = req.body.from;

        if (req.body.location) newExp.location = req.body.location;
        if (req.body.current) newExp.current = req.body.current;
        if (req.body.description) newExp.description = req.body.description;

        profile.experience.unshift(newExp);

        // console.log("newExp", newExp);
        // console.log("profile", profile);

        profile
          .save()
          .then(profile => res.json(profile))
          .catch(err =>
            json.status(500).send({ profile: "Failed to save experience" })
          );
      })
      .catch(err => {
        console.log(err);
        res.status(500).send({ profile: "Failed to add experience" });
      });
  }
);

router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    if (!isValid) res.status(400).send(errors);

    console.log("user", req.user.id);

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const newEdu = {};
        newEdu.school = req.body.school;
        newEdu.degree = req.body.degree;
        newEdu.fieldofstudy = req.body.fieldofstudy;
        newEdu.from = req.body.from;

        if (req.body.to) newEdu.to = req.body.to;
        if (req.body.current) newEdu.current = req.body.current;
        if (req.body.description) newEdu.description = req.body.description;

        profile.education.unshift(newEdu);

        // console.log("newExp", newExp);
        // console.log("profile", profile);

        profile
          .save()
          .then(profile => res.json(profile))
          .catch(err => {
            console.log(err);
            res.status(500).send({ profile: "Failed to save education" });
          });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send({ profile: "Failed to add education" });
      });
  }
);

router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);

        console.log(removeIndex);

        if (removeIndex === -1)
          return res.status(404).send({ profile: "Invalid experience id" });

        profile.experience.splice(removeIndex, 1);
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => {
        console.log(err);
        errors.profile = "Failed to delete experience";
        res.status(500).send(errors);
      });
  }
);

router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);

        // Splice out of array
        profile.education.splice(removeIndex, 1);

        // Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() =>
        res.json({ success: true })
      );
    });
  }
);

module.exports = router;
