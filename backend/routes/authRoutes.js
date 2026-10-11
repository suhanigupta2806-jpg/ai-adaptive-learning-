const express = require('express');

const {

    registerStudent,

    loginStudent,

    getProfile,

    updateProfile,

    forgotPassword

} = require('../controllers/authController');


const authenticateToken =
    require('../middleware/authMiddleware');


const router =
    express.Router();


// ============================================================
// REGISTER
// ============================================================

router.post(

    '/register',

    registerStudent

);


// ============================================================
// LOGIN
// ============================================================

router.post(

    '/login',

    loginStudent

);


// ============================================================
// FORGOT PASSWORD
// ============================================================

router.post(

    '/forgot-password',

    forgotPassword

);


// ============================================================
// GET PROFILE
// ============================================================

router.get(

    '/profile',

    authenticateToken,

    getProfile

);


// ============================================================
// UPDATE PROFILE
// ============================================================

router.put(

    '/profile',

    authenticateToken,

    updateProfile

);


module.exports = router;