import UserFinesList from '../../../components/fines/UserFinesList';

export default function ActiveFines() {
  return <UserFinesList status="Unpaid" title="Active Fines" showSearch showPay />;
}