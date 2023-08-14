import React from 'react'
import {
    Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';

const SnackBar = (props) => {

    return (
        <Snackbar open={props.open}>
            <MuiAlert elevation={6} variant="filled" severity={props.severity}>
                {props.message}
            </MuiAlert>
        </Snackbar>
    )
}
export default SnackBar;