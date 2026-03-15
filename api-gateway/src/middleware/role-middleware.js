const authorizeRole = (...admittedRoles) => {
  return (req, res, next) => {
    if (!admittedRoles.includes(req.usuario.rol)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = authorizeRole;