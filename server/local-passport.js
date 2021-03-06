// load all the things we need
import { Strategy } from 'passport-local';

// load up the user model
import User from './models/user';
// expose this function to our app using module.exports
export default function (passport) {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-signup', new Strategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true, // allows us to pass back the entire request to the callback
  },
  (req, email, password, done) => {
    // asynchronous
    // User.findOne wont fire unless data is sent back
    process.nextTick(() => {
    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
      User.findOne({ email }, (err, user) => {
        // if there are any errors, return the error
        if (err) {
          return done(err);
        }
        // check to see if theres already a user with that email
        if (user) {
          return done(null, false);
        }
        // if there is no user with that email
        // create the user
        const newUser = new User();

        // set the user's local credentials
        newUser.email = email;
        newUser.password = newUser.generateHash(password);
        // save the user
        newUser.save((saveError) => {
          if (saveError) {
            throw saveError;
          }
          return done(null, newUser);
        });
        return undefined;
      });
    });
  }));
}
