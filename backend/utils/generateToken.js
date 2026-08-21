import jwt from 'jsonwebtoken'

const getJwtCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
});

const generateToken = (res, userId) => {
    const token = jwt.sign(
        { userId},
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    )
    
    // Set JWT as HTTP-Only cookie
    res.cookie('jwt', token, {
        ...getJwtCookieOptions(),
        maxAge: 30*24*60*60*1000 // 30 days
    })
}

export { getJwtCookieOptions };
export default generateToken;
