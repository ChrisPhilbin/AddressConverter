require("dotenv").config()

const fetch = require("node-fetch")


exports.getVerifiedAddress = (request, response) => {
    const address = request.body.address
    const formattedUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_G_API}`
    fetch(formattedUrl)
    .then(response => response.json())
    .then(data => {
        return response.json(data)
    })
    .catch(error => {
        return response.status(400).json(error)
    })
}