exports.getVerifiedAddress = (request, response) => {
    //function takes in an address and verifies it against google's geocoding database
    const address = request.body.address

    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_G_API}`)
    .then(response => response.json())
    .then(data => {
        return response.json(data)
    })
}