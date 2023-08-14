import { CardMedia, DialogContent } from '@mui/material'
import React, { Fragment } from 'react'
import {imageEnlargement} from "../components/style";

function ViewImage({source}) {
    return (
        <Fragment>
            <DialogContent>
                <CardMedia
                    component="img"
                    src={source}
                    style={imageEnlargement}
                />
            </DialogContent>
        </Fragment>
    )
}

export default ViewImage