module.exports.handleError = (err) => {
    console.log(err.message || (err.body && err.body.message) || err.body || err);

    process.exit(1);
};
