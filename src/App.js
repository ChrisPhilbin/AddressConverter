import React, { useState } from 'react'
import {ExcelRenderer} from 'react-excel-renderer'
import Container from '@material-ui/core/Container'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Input from '@material-ui/core/Input'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  addressData: {
    marginTop: '30px',
    textAlign: 'center'
  },
  startHere: {
    textAlign: 'center',
    marginTop: '80px'
  }
}))

const App = () => {

  const classes = useStyles()

  let [file, setFile]                           = useState(null)
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
    let personDetails = {}
    let newArr = []
    
    rows.slice(1).map((row) => {
      personDetails = {}
      personDetails["firstName"] = row[indexValues.firstName]
      personDetails["lastName"] = row[indexValues.lastName]
      personDetails["address"] = row[indexValues.address].match(/\(([^)]+)\)/)[1]
      personDetails["url"] = `https://maps.googleapis.com/maps/api/geocode/json?address=${personDetails.address}&key=${process.env.REACT_APP_G_API}` 
      newArr.push(personDetails)
    })
      newArr.forEach((details) => {
        fetch(details.url)
        .then(response => response.json())
        .then(data => {
          details["verifiedDetails"] = data
          setVerifiedAddresses(verifiedAddresses => [...verifiedAddresses, details])
        })
      })
      // Promise.all(newArr.map(details => fetch(details.url))).then(responses => 
      //   Promise.all(responses.map(res => res.json()))
      //     .then(data => data.map((result) => {
      //       console.log(result, "result")
      //       //iterate over newArr, find where result.formatted_address matches the street address
      //       setVerifiedAddresses(verifiedAddresses => [...verifiedAddresses, result.results[0].formatted_address])
      //     }))
      //   )
  }
console.log(verifiedAddresses, "verified addresses")
  return (
    <Container>

      <Grid container spacing={3}>

        <Grid item xs={12} className={classes.startHere}>
          { !file ?
            <>
              <Typography variant="h4" gutterBottom>Upload file</Typography>

              <Input accept="*" id="upload-button" style={{display: 'none'}} onChange={(e) => setFile(e.target.files[0])} type="file" />

              <label htmlFor="upload-button">
                <Button variant="contained" color="primary" component="span">Upload your file</Button>
              </label>
            </>
          :
            <>
              <Button variant="contained" color="primary" onClick={() => handleConvert(extract)}>Convert</Button>
            </>
          }
        </Grid>

        <Grid item xs={12} className={classes.addressData}>
          { isVerified? 
            <>
              {verifiedAddresses.map((address) => (
                <div>
                  {address.firstName} {address.lastName} {address.address}
                </div>
              ))}
            </>
          : null }
        </Grid>
      </Grid>
    </Container>
  )
}

export default App