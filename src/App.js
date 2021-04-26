import React, { useState } from 'react'
import {ExcelRenderer, OutTable} from 'react-excel-renderer'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Input from '@material-ui/core/Input'

const App = () => {

  let [file, setFile]           = useState(null)
  let [cols, setCols]           = useState(null)
  let [rows, setRows]           = useState(null)
  let [addresses, setAddresses] = useState([])

  const handleConvert = () => {
    ExcelRenderer(file, (err, resp) => {
      if(err){
        console.log(err)
      } else {
        setCols(resp.cols)
        setRows(resp.rows)
      }
    })
  }

  const extract = () => {
    rows.slice(1).map((row) => {
      let a = row[2].match(/\(([^)]+)\)/)[1]
      setAddresses(addresses => [...addresses, a])
    })
  }

  console.log(rows, "rows")
  console.log(addresses, "addresses")

  return (
    <Container>
      <Typography variant="h4">Step 1: Upload file</Typography>
      <Input type="file" onChange={(e) => setFile(e.target.files[0]) } />
      { file ? <Button onClick={() => handleConvert()}>Convert</Button> : null}
      <Button onClick={() => extract()}>Extract</Button>
    </Container>

  )
}

export default App