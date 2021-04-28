import React, { useState } from 'react'
import {ExcelRenderer} from 'react-excel-renderer'
import Container from '@material-ui/core/Container'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Input from '@material-ui/core/Input'

const App = () => {

  let [file, setFile]                           = useState(null)
  let [rawAddresses, setRawAddresses]           = useState([])
  let [verifiedAddresses, setVerifiedAddresses] = useState([])
  let [isVerified, setIsVerified]               = useState(false)

  function handleConvert(extractCallback) {
    ExcelRenderer(file, (err, resp) => {
      if(err){
        console.log(err)
      } else {
        extractCallback(resp.rows)
      }
    })

  }

  const extract = (rows) => {

    //first get the index values of the rows to find where firstname, lastname, address live
    let indexValues = {}

    rows[0].forEach((row, index) => {
        if (row.includes('first')) {
            indexValues.firstName = index
        }
        if (row.includes('last')) {
            indexValues.lastName = index
        }
        if (row.includes('other')) {
            indexValues.address = index
        }
    })
    let newArr = []
    let personDetails = {}
    //iterate over the each row again and find the text that is in between ( and )
    rows.slice(1).map((row) => {
      personDetails.firstName = row[indexValues.firstName]
      personDetails.lastName = row[indexValues.lastName]
      personDetails.address = row[indexValues.address].match(/\(([^)]+)\)/)[1]
      newArr.push(personDetails)
    })
    setRawAddresses(newArr)
  }

  const verifyAddresses = () => {
    let verifiedPerson = {}
    let newArr = []
    rawAddresses.map((details) => {
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${details.address}&key=${process.env.REACT_APP_G_API}`)
      .then(response => response.json())
      .then(data => {
        verifiedPerson.address = data.results[0].address_components
        verifiedPerson.firstName = details.firstName
        verifiedPerson.lastName = details.lastName
        newArr.push(verifiedPerson)
      })
    })
    setVerifiedAddresses(verifiedAddresses => [...verifiedAddresses, newArr])
    setIsVerified(true)
  }

  return (
    <Container>
      <Typography variant="h4">Step 1: Upload file</Typography>
      <Input type="file" onChange={(e) => setFile(e.target.files[0]) } />
      { file ? <Button onClick={() => handleConvert(extract)}>Convert</Button> : null}
      <Button onClick={() => verifyAddresses()}>Verify Addresses</Button>
    
      { isVerified? 
        <>
          {verifiedAddresses.map((address) => (
            <div>
              {console.log(address, "address object")}
              {address.address[0].long_name} {address.address[1].long_name} {address.address[2].long_name} {address.address[5].long_name} {address.address[7].long_name}
            </div>
          ))}
        </>
      : null }

    </Container>
  )
}

export default App