const createStripeAccount = async (req, res) => {
  const user = await User.findById(req.user._id);

  const account = await stripe.accounts.create({
    type: "express",
    country: "US",
    email: user.email,
  });

  user.stripeAccountId = account.id;
  await user.save();

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: "https://yourdomain.com/reauth",
    return_url: "https://yourdomain.com/account-complete",
    type: "account_onboarding",
  });

  res.send({ url: accountLink.url });
};
