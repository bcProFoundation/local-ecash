import styled from '@emotion/styled';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { Link } from '@tanstack/react-router';

const Section = styled.div`
  padding: 1rem;
  padding-bottom: 0;
  display: flex;
  justify-content: space-between;
  svg {
    font-size: 24px;
    color: #0088cc;
  }
`;

type HeaderProps = {
  id?: string;
};

function Header(props: HeaderProps) {
  return (
    <Section>
      <div>
        <Link to="/qpay">
          <ReceiptIcon />
        </Link>
      </div>
      <div>
        <Link to="/setting">
          <SettingsOutlinedIcon />
        </Link>
      </div>
    </Section>
  );
}

export default Header;
