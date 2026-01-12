"use client";

import { useState } from "react";
import { 
  Box, 
  Tab, 
  Tabs, 
  Container,
  Badge
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import MailIcon from "@mui/icons-material/Mail";
import LinkIcon from "@mui/icons-material/Link";
import { ContactInfo, Inquiry, SocialMedia } from "@prisma/client";
import { ContactSettingsForm } from "@/components/admin/contact/ContactSettingsForm";
import { SocialMediaForm } from "@/components/admin/contact/SocialMediaForm";
import { InquiryList } from "@/components/admin/contact/InquiryList";

interface AdminContactClientProps {
  contactInfo: ContactInfo | null;
  inquiries: Inquiry[];
  socialMedias: SocialMedia[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`contact-tabpanel-${index}`}
      aria-labelledby={`contact-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 1 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export function AdminContactClient({ contactInfo, inquiries, socialMedias }: AdminContactClientProps) {
  const [tab, setTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const newMessagesCount = inquiries.filter(i => i.status === "NEW").length;

  return (
    <Container maxWidth="xl" sx={{ pb: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs 
          value={tab} 
          onChange={handleTabChange} 
          aria-label="contact management tabs"
          sx={{ 
            "& .MuiTab-root": { 
              minHeight: 48, 
              textTransform: "none", 
              fontSize: 16, 
              fontWeight: "medium",
              mr: 2
            } 
          }}
        >
          <Tab 
            icon={<SettingsIcon fontSize="small" />} 
            iconPosition="start" 
            label="Kontak Perusahaan" 
          />
          <Tab 
            icon={<LinkIcon fontSize="small" />} 
            iconPosition="start" 
            label="Media Sosial" 
          />
          <Tab 
            icon={
              <Badge badgeContent={newMessagesCount} color="error" sx={{ "& .MuiBadge-badge": { right: -3, top: 3 } }}>
                <MailIcon fontSize="small" />
              </Badge>
            } 
            iconPosition="start" 
            label="Pesan Masuk" 
          />
        </Tabs>
      </Box>

      <Box>
        <CustomTabPanel value={tab} index={0}>
          <ContactSettingsForm initialData={contactInfo} />
        </CustomTabPanel>
        <CustomTabPanel value={tab} index={1}>
          <SocialMediaForm socialMedias={socialMedias} />
        </CustomTabPanel>
        <CustomTabPanel value={tab} index={2}>
          <InquiryList initialInquiries={inquiries} />
        </CustomTabPanel>
      </Box>
    </Container>
  );
}

