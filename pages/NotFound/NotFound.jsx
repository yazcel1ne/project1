import React from 'react'
import { Grid, Paper, Typography, Box } from '@mui/material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';



const NotFound = () => {
 return (

  <Grid>
   <Box >


    <Typography variant="h6" textAlign='center'sx={{ fontSize: '11rem', color: '#444A69', fontWeight: 'bold', }}>4<SentimentVeryDissatisfiedIcon sx={{fontSize: '8rem'}}/>4</Typography>
    <Typography variant="h6" textAlign='center' sx={{ fontSize: '2rem', color: '#444A69' , fontWeight: 'bold'}}>Ooops! Page not found</Typography>
    <Typography variant="h6" textAlign='center' sx={{ fontSize: '1rem', color: '#444A69' , fontWeight: 'bold'}}>The page you were looking for doesn't exist.</Typography>
  
   </Box>
  </Grid >
 )
}

export default NotFound;
