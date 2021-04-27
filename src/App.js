import React, { useState } from 'react'
import {ExcelRenderer, OutTable} from 'react-excel-renderer'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Input from '@material-ui/core/Input'

const App = () => {

  let [file, setFile]                           = useState(null)
  let [cols, setCols]                           = useState(null)
  let [rows, setRows]                           = useState(null)
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
    console.log(rows, "rows passed in to extract")
    let newArr = []
    rows.slice(1).map((row) => {
      let a = row[2].match(/\(([^)]+)\)/)[1]
      newArr.push(a)
    })
    setRawAddresses(newArr)
  }

  const verifyAddresses = () => {
    let newArr = []
    rawAddresses.map((address) =>{
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_G_API}`)
      .then(response => response.json())
      .then(data => {
        let r = data.results[0].address_components
        newArr.push(r)
      })
    })
    setVerifiedAddresses(newArr)
    setIsVerified(true)
  }

  const renderAddresses = (
      <>
        {verifiedAddresses.map((address) => (
          <div>
            {address[0].long_name} {address[1].long_name} {address[2].long_name} {address[5].long_name} {address[7].long_name}
          </div>
        ))}
      </>
    )

  console.log(rawAddresses, "raw addresses")
  console.log(verifiedAddresses, "verified addresses")

  return (
    <Container>
      <Typography variant="h4">Step 1: Upload file</Typography>
      <Input type="file" onChange={(e) => setFile(e.target.files[0]) } />
      { file ? <Button onClick={() => handleConvert(extract)}>Convert</Button> : null}
      <Button onClick={() => verifyAddresses()}>Verify Addresses</Button>
    
      { isVerified? {renderAddresses} : null }

    </Container>
  )
}

export default App