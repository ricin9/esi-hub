import React, { useState } from 'react'
import "./Workspace.css"
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { Workspaces } from "@mui/icons-material"
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PersonIcon from '@mui/icons-material/Person';
import DoneIcon from '@mui/icons-material/Done';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Select, TextField, MenuItem, FormControl, InputLabel } from '@mui/material';
import { bgcolor, width } from '@mui/system';
const CreateWorkspace = ({ open, handleClose }) => {
   
    const style = {
     
      position: 'absolute',
      textAlign:"center",
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 400,
      bgcolor:'background.paper',
      border: '2px solid #000',
      borderRadius:'10px',
      boxShadow: 24,
      p: 4,
    };
    const handleSubmit=()=>{}
    const handleChange=()=>{}
    return (<>
  
      {open && <div>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2" sx={{padding:2}}>
              Create New WorkSpace
            </Typography>
            <form onSubmit={handleSubmit}>
            <TextField className="AddTaskCardTextInput" name="WorkSpace Title" label="WorkSpace Name"
            multiline type="text"
            onChange={handleChange}
            sx={{
              width:300,
              bgcolor: 'white',
              marginLeft: 2,
              borderRadius: 2,
              marginBottom: 2,
              marginTop: 2,
              height: 55
            }} />
  <TextField className="AddTaskCardTextInput" name="WorkSpace Title" label="Add Members"
            multiline type="text"
            onChange={handleChange}
            sx={{
              width:300,
              bgcolor: 'white',
              marginLeft: 2,
              borderRadius: 2,
              marginBottom: 2,
              marginTop: 2,
              height: 95
            }} />
          
          
          <Button type="submit" variant="contained" sx={{
            width:200,
            
          }}>ADD</Button>
          </form>
          </Box>
        </Modal>
      </div>}</>)}
   export default CreateWorkspace;