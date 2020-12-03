const crypto = require("crypto");
const { SchemaComposer } = require("graphql-compose");
const { UserTC, User } = require("../models/user");
const { createSendToken, protect } = require("../helpers/auth");

const schemaComposer = new SchemaComposer();

const AuthenticateUserPayload = schemaComposer.createObjectTC({
  name: "AuthenticateUserPayload",
  fields: {
    status: "String",
    message: "String",
    recordID: "ID",
    record: UserTC,
    token: "String",
  },
});

UserTC.addResolver({
  name: "signUpUser",
  args: { email: "String!", password: "String!" },
  type: AuthenticateUserPayload,
  resolve: async ({ args }) => {
    const newUser = await User.create(args);
    return createSendToken(newUser, 201, {});
  },
});

UserTC.addResolver({
  name: "loginUser",
  args: { email: "String!", password: "String!" },
  type: AuthenticateUserPayload,
  resolve: async ({ args }) => {
    const { email, password } = args;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new Error("Please provide email and password!");
    }
    // 3) if everything ok, send token to client
    return createSendToken(user, 200, {});
  },
});

UserTC.addResolver({
  name: "updatePassword",
  args: { password: "String!" },
  type: UserTC,
  resolve: async ({ args, context }) => {
    const reqUser = this.protect(context);

    const user = await User.findById(reqUser._id).select("+password");

    user.password = args.password;
    await user.save();

    // 4) Log the user in, send JWT
    return createSendToken(user, 200, {});
  },
});

UserTC.addResolver({
  name: "forgotPassword",
  args: { email: "String!" },
  type: AuthenticateUserPayload,
  resolve: async ({ args }) => {
    const user = await User.findOne({ email: args.email });

    if (!user) {
      // throw new Error('There is no user with this email address.', 404);
      return {
        status: "success",
      };
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    // try {
    //   return {
    //     status: "success",
    //     message: "Token sent to email!",
    //   };
    // } catch (err) {
    //   user.passwordResetToken = undefined;
    //   user.passwordResetExpires = undefined;
    //   await user.save({ validateBeforeSave: false });

    //   throw new Error("There was an error sending the email. Try again later!");
    // }
    return {
      status: "success",
      message: "Token sent to email!",
      token: resetToken,
    };
  },
});

UserTC.addResolver({
  name: "resetPassword",
  args: { password: "String!", resetToken: "String" },
  type: AuthenticateUserPayload,
  resolve: async ({ args }) => {
    // const { resetToken: token } = context;
    const { resetToken: token } = args;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error("Token is invalid or has expired", 400);
    }

    user.password = args.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return createSendToken(user, 200, {});
  },
});

UserTC.addResolver({
  name: "getMe",
  type: UserTC,
  resolve: async ({ context }) => {
    await protect(context);
    const { user } = context;
    return user;
  },
});

UserTC.extendField("password", {
  resolve: () => "",
});

const UserQuery = {
  getMe: UserTC.getResolver("getMe"),
  getUsers: UserTC.mongooseResolvers.findMany,
  getUserById: UserTC.mongooseResolvers.findById,
  getUserByField: UserTC.mongooseResolvers.findOne,
};

const UserMutation = {
  updateUserById: UserTC.mongooseResolvers.updateById({
    record: {
      removeFields: [
        "password",
        "passwordChangedAt",
        "passwordResetExpires",
        "passwordResetToken",
        // "createdAt",
      ],
    },
  }),
  deleteUserById: UserTC.mongooseResolvers.removeById,
  loginUser: UserTC.getResolver("loginUser"),
  signUpUser: UserTC.getResolver("signUpUser"),
  forgotPassword: UserTC.getResolver("forgotPassword"),
  resetPassword: UserTC.getResolver("resetPassword"),
  updatePassword: UserTC.getResolver("updatePassword"),
};

module.exports = { UserQuery, UserMutation };
