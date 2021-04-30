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
          setIsVerified(true)
        })
      })
  }

  console.log(verifiedAddresses)

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
                  {verifiedAddresses.map((row) => (
                    <TableRow key={row.firstName}>
                      <TableCell component="th" scope="row">
                        {row.firstName} {row.lastName}
                      </TableCell>
                      <TableCell align="right">{row.verifiedDetails.results[0].address_components[0].long_name} {row.verifiedDetails.results[0].address_components[1].long_name} </TableCell>
                      <TableCell align="right">{row.verifiedDetails.results[0].address_components[2].long_name}</TableCell>
                      <TableCell align="right">{row.verifiedDetails.results[0].address_components[4].long_name}</TableCell>
                      <TableCell align="right">{row.verifiedDetails.results[0].address_components[5].long_name}</TableCell>
                      <TableCell align="right">{row.verifiedDetails.results[0].address_components[6].long_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          : null }
        </Grid>
      </Grid>
    </Container>
  )
}

export default App