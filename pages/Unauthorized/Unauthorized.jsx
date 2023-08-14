import React from 'react'
import { Grid, Paper, Typography, Box } from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';



const Unauthorized = () => {
  return (

    <Grid>
      <Box sx={{ margin: 'auto' }}>

        <Typography variant="h6" textAlign='center'><ReportProblemIcon sx={{ fontSize: '13rem', color: '#ED6825' }} /></Typography>
        <Typography variant="h6" textAlign='center' sx={{ fontSize: '4rem', color: '#585D5E', fontWeight: 'bold' }}>401</Typography>
        <Typography variant="h6" textAlign='center' sx={{ fontSize: '2rem', color: '#585D5E', fontWeight: 'bold' }}>
          YOU ARE{' '}
          <Typography component="span" style={{ fontSize: '2rem', color: '#ED6825', fontWeight: 'bold' }}>
             NOT AUTHORIZED{' '}
          </Typography>
          TO ACCESS THIS PAGE.
        </Typography>


      </Box>
    </Grid >
  )
}

export default Unauthorized ;
