require("dotenv").config()

const fetch = require("node-fetch")


exports.getVerifiedAddress = (request, response) => {
    //function takes in an address and verifies it against google's geocoding database
    console.log(request.body, "<=== request body address")
    const address = request.body.address
    console.log(address, "<=== address")
    const formattedUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_G_API}`
    console.log(formattedUrl, "<=== formatted URL")
    
    fetch(formattedUrl)
    .then(response => response.json())
    .then(data => {
        return response.json(data)
    })
}