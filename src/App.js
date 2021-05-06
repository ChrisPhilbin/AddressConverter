import React, { useState } from 'react'
import {ExcelRenderer} from 'react-excel-renderer'
import Container from '@material-ui/core/Container'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Input from '@material-ui/core/Input'
import Grid from '@material-ui/core/Grid'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  addressData: {
    marginTop: '30px',
    textAlign: 'center'
  },
  addressErrors: {
    backgroundColor: '#ffcccb',
    borderRadius: '25px'
  },
  congratsMessage: {
    color: 'green',
    fontWeight: 'bold'
  },
  fatalError: {
    textAlign: 'center',
    backgroundColor: '#ffcccb'
  },
  startHere: {
    textAlign: 'center',
    marginTop: '80px'
  },
  startOver: {
    textAlign: 'center',
    paddingTop: '50px',
    marginTop: '80px',
    marginBottom: '30px'
  }
}))

const App = () => {

  const classes = useStyles()

  let [file, setFile]                           = useState(null)
  let [verifiedAddresses, setVerifiedAddresses] = useState([])
  let [invalidAddresses, setInvalidAddresses]   = useState([])
  let [isVerified, setIsVerified]               = useState(false)
  let [showConvertButton, setShowConvertButton] = useState(false)
  let [errors, setErrors]                       = useState(false)
  let [fatalError, setFatalError]               = useState(false)

  const uploadFile = (file) => {
    setFile(file)
    setShowConvertButton(true)
  }

  const startOver = () => {
    if (window.confirm("Are you sure?")) {
      window.location.reload()
    }
  }

  function handleConvert(extractCallback) {
    ExcelRenderer(file, (err, resp) => {
      if(err){
        console.log(err)
        setFatalError(true)
      } else {
        extractCallback(resp.rows)
      }
    })

  }

  const extract = (rows) => {
    let indexValues = {}

    rows[0].forEach((row, index) => {
        if (row.toLowerCase().includes('first')) {
            indexValues.firstName = index
        }
        if (row.toLowerCase().includes('last')) {
            indexValues.lastName = index
        }
        if (row.toLowerCase().includes('other')) {
            indexValues.address = index
        }
    })
    let personDetails = {}
    let newArr = []
    
    rows.slice(1).forEach((row) => {
      if (row[indexValues.address] === '' || row[indexValues.address] === null || row[indexValues.address] === undefined || row[indexValues.address].toLowerCase().includes("test")){
        return
      }
      personDetails = {}
      personDetails["firstName"] = row[indexValues.firstName]
      personDetails["lastName"] = row[indexValues.lastName]
      personDetails["address"] = row[indexValues.address].match(/\(([^)]+)\)/)[1]
      personDetails["url"] = `https://maps.googleapis.com/maps/api/geocode/json?address=${personDetails.address}&key=${process.env.REACT_APP_G_API}` 
      newArr.push(personDetails)
    })
      newArr.forEach((details) => {
        // fetch(details.url)
        let lookUp = {
          address: details.address
        }
        fetch(process.env.REACT_APP_CORS + 'https://us-central1-address-converter-9254d.cloudfunctions.net/api/convert', {
          method: 'post',
          body: JSON.stringify(lookUp),
          headers: {
            'Content-Type':'application/json'
          }
        })
        .then(response => {
          if (response.status === 200) {
            response.json()
            .then(data => {
              console.log(data, "data coming back")
              if (data.status === "OK") {
                data.results[0].address_components.forEach((component) => {
                  if (component.types.includes("locality")) {
                    details["city"] = component.long_name
                  }
                  if (component.types.includes("administrative_area_level_1")) {
                    details["stateprovince"] = component.long_name
                  }
                  if (component.types.includes("country")) {
                    details["country"] = component.long_name
                  }
                  if (component.types.includes("postal_code")) {
                    details["postal_code"] = component.long_name
                  }
                })
                details["verifiedDetails"] = data
                setVerifiedAddresses(verifiedAddresses => [...verifiedAddresses, details])
                setShowConvertButton(false)
                setIsVerified(true)
              } else {
                console.log("Error verifying the following set of data:", details)
                setInvalidAddresses(invalidAddresses => [...invalidAddresses, details])
                setErrors(true)
              }
            })
          } else {
            console.log("Error, something went wrong!")
          }
        })

      })
  }

  if(fatalError) {
    return (
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12} className={classes.fatalError}>
            <Typography variant="h2" gutterButton>Error: Something went wrong</Typography>
          </Grid>
        </Grid>
      </Container>
    )
  }

  if (!isVerified) {
    return (
      <Container>

        <Grid container spacing={3}>

          <Grid item xs={12} className={classes.startHere}>
            { !file ?
              <>
                <Typography variant="h4" gutterBottom>Upload file</Typography>

                <Input accept="*" id="upload-button" style={{display: 'none'}} onChange={(e) => uploadFile(e.target.files[0])} type="file" />

                <label htmlFor="upload-button">
                  <Button variant="contained" color="primary" component="span">Upload your file</Button>
                </label>
              </>
            :
              null
            }

            { showConvertButton ?
                <>
                  <Typography variant="h4" gutterBottom>Convert your file</Typography>

                  <Button variant="contained" color="primary" onClick={() => handleConvert(extract)}>Convert</Button>
                </>
            :
              null
            }
          </Grid>

        </Grid>
      </Container>
    )
  } else {
    return (
        <Container>

          <Grid container spacing={3}>
            <Grid item xs={12} className={classes.startOver}>
              <Button variant="contained" color="primary" onClick={() => startOver()}>Start over</Button>
            </Grid>
            {errors? 
              <Grid item xs={12} className={classes.addressErrors}>
                <h5>The following {invalidAddresses.length} address(es) could not be verified properly:</h5>
                {invalidAddresses.map((details, index) => (
                  <li key={index}>{details.firstName} {details.lastName} {details.address}</li>
                ))}
              </Grid>
            :
              null
            }
            <Grid item xs={12} className={classes.addressData}>
                  <span className={classes.congratsMessage}>Congrats - {verifiedAddresses.length} addresses have been sucessfully converted!</span>
                  <TableContainer component={Paper}>
                    <Table className={classes.table} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>First & Last name</TableCell>
                          <TableCell align="right">Street</TableCell>
                          <TableCell align="right">City</TableCell>
                          <TableCell align="right">State / Province</TableCell>
                          <TableCell align="right">Country</TableCell>
                          <TableCell align="right">Zip / Postal code</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {verifiedAddresses.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell component="th" scope="row">
                              {row.firstName} {row.lastName}
                            </TableCell>
                            <TableCell align="right">{row.verifiedDetails.results[0].address_components[0].long_name} {row.verifiedDetails.results[0].address_components[1].long_name} </TableCell>
                            <TableCell align="right">{row.city}</TableCell>
                            <TableCell align="right">{row.stateprovince}</TableCell>
                            <TableCell align="right">{row.country}</TableCell>
                            <TableCell align="right">{row.postal_code}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
            </Grid>
        </Grid>
      </Container>
    )
  }
}

export default App