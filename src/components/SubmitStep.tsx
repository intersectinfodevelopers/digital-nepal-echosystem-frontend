import React from 'react';
import { Stack, Typography, Box, Paper, Button } from '@mui/material';
import { 
  CheckCircleOutlined as IconSuccess,
  DescriptionOutlined as IconReview
} from '@mui/icons-material';
import type { RegistrationFormData } from '@/types/citizen';

interface SubmitStepProps {
  formData: RegistrationFormData;
  onSubmit: () => void;
}

export function SubmitStep({ formData, onSubmit }: SubmitStepProps) {
  return (
    <Stack spacing={4}>
      <Paper elevation={0} className="p-12 border border-gray-200 rounded-[40px] bg-white shadow-sm">
        <Stack spacing={6} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Box className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-[#003893] shadow-lg">
            <IconReview className="text-6xl" />
          </Box>
          
          <Box>
            <Typography variant="h3" className="font-poppins font-bold text-[#0F172A] mb-4">
              Final Review
            </Typography>
            <Typography className="text-[#64748B] text-xl max-w-2xl mx-auto leading-relaxed font-medium">
              Please ensure all information provided is accurate. Once submitted, the profile will be sent for official verification by the ward office.
            </Typography>
          </Box>
          <Box className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <Paper className="p-8 rounded-4xl bg-gray-50/50 border border-gray-100 shadow-sm">
              <Typography variant="subtitle2" className="text-gray-400 uppercase tracking-widest font-bold mb-4">Primary Applicant</Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography className="text-gray-500 text-sm">Full Name (EN)</Typography>
                  <Typography className="text-[#0F172A] font-bold text-lg">{formData.name_en || 'Not provided'}</Typography>
                </Box>
                <Box>
                  <Typography className="text-gray-500 text-sm">Date of Birth</Typography>
                  <Typography className="text-[#0F172A] font-bold text-lg">{formData.dob || 'Not provided'}</Typography>
                </Box>
                <Box>
                  <Typography className="text-gray-500 text-sm">Gender</Typography>
                  <Typography className="text-[#0F172A] font-bold text-lg">{formData.sex || 'Not provided'}</Typography>
                </Box>
              </Stack>
            </Paper>

            <Paper className="p-8 rounded-4xl bg-gray-50/50 border border-gray-100 shadow-sm">
              <Typography variant="subtitle2" className="text-gray-400 uppercase tracking-widest font-bold mb-4">Documentation</Typography>
              <Stack spacing={2}>
                <Box className="flex items-center justify-between">
                  <Typography className="text-gray-500 text-sm">NID Verified</Typography>
                  {formData.nid_verified ? <IconSuccess className="text-emerald-500" /> : <Typography className="text-red-500 font-bold">Pending</Typography>}
                </Box>
                <Box className="flex items-center justify-between">
                  <Typography className="text-gray-500 text-sm">Citizenship Images</Typography>
                  {formData.citizenship_front && formData.citizenship_back ? <IconSuccess className="text-emerald-500" /> : <Typography className="text-red-500 font-bold">Incomplete</Typography>}
                </Box>
                <Box className="flex items-center justify-between">
                  <Typography className="text-gray-500 text-sm">Portrait Photo</Typography>
                  {formData.photo ? <IconSuccess className="text-emerald-500" /> : <Typography className="text-red-500 font-bold">Missing</Typography>}
                </Box>
              </Stack>
            </Paper>
          </Box>
          <Box className="w-full max-w-xl py-10 px-12 bg-blue-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group transition-all hover:scale-[1.02]">
            <Box className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-blue-800 to-transparent opacity-50" />
            <Stack spacing={4} className="relative z-10">
              <Box>
                <Typography variant="h5" className="font-poppins font-bold mb-2">Ready to Register?</Typography>
                <Typography className="text-blue-200 font-medium">Click below to finalize the digital identity creation.</Typography>
              </Box>
              <Button 
                variant="contained" 
                fullWidth
                onClick={onSubmit}
                size="large"
                className="bg-white text-blue-900 hover:bg-blue-50 font-poppins font-bold py-5 rounded-2xl text-xl shadow-xl"
              >
                Complete Registration
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}
