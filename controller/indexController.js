const getIndex = (req, res) => {
	res.render("Home/index");
};

const getError403 = (req, res) => {
	res.render("Home/unauthorized");
};
const getError404 = (req, res) => {
	res.render("Home/notfound");
};
export default {
	getIndex,
	getError403,
	getError404,
};
