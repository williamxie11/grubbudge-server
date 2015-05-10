module.exports = function (app, passport) {



	function isLoggedIn(req, res, next) {
		if(req.isAuthenticated())
			return next();

		res.json({
			error: "User not logged in."
		});
	}
};