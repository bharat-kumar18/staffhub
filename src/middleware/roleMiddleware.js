exports.SuperAdmin = (req, res, next) => {
  try {
    // assuming roleId = 1 is SUPER_ADMIN
    if (req.roleId !== 1) {
      return res.status(403).json({
        message: "Access denied. Super Admin only"
      });
    }

    next();
  } catch (err) {
    res.status(500).json({
      message: "Server error"
    });
  }
};