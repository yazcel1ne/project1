import React from 'react'
import { Paper } from '@mui/material'

const DatagridHeight = (props) => {
  return (
    <Paper sx={{
      height: "73vh",
      padding: "10px",
      borderRadius: "20px",
    }}
    >
      {props.children}
    </Paper>
  )
}

export default DatagridHeight;
