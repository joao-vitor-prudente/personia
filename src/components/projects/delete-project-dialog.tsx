import { Button } from "@/components/ui/button.tsx";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";

export function DeleteProjectDialog(props: {
  deleteProject: () => void;
  name: string;
}) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogDescription>
          <span>Are you sure you want to delete </span>
          <span>{props.name}</span>
          <span>?</span>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button onClick={props.deleteProject} variant="destructive">
            Confirm
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
