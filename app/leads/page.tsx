import { requireStaffUser } from "@/app/auth";
import Desk from "./desk";
export const dynamic = "force-dynamic";
export default async function Page() {
  await requireStaffUser("/leads");
  return <Desk />;
}
