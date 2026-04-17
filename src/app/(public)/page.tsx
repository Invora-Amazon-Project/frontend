import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-page-bg flex items-center justify-center">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-semibold text-heading">
          Welcome to Invora
        </h1>
        <p className="text-muted mt-2">Font and colors are working.</p>

        {/*Testing Buttons */}
        <div className="flex gap-3">
          <Button variant="primary" size="lg">
            Get started
          </Button>
          <Button variant="outline" size="md">
            See how it works
          </Button>
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
        </div>

        {/*Testing badges*/}
        <div className="flex gap-3">
          <Badge variant="default">Info</Badge>
          <Badge variant="success">Active</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="danger">Cancelled</Badge>
        </div>

        <Card>
          <p>Default card</p>
        </Card>

        <Card variant="featured">
          <p>Featured / highlighted card</p>
        </Card>
      </div>
    </div>
  );
};
export default LandingPage;
