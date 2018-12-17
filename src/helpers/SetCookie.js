
module.exports = {
    setCookie(ctx, token, maxAge) {
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: maxAge
        });
    }
};