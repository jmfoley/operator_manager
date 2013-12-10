

exports.usersView = function (req, res) {
  res.render('usersView', { title: 'Users', access_level: '' });
};