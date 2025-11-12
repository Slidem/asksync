"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toGroupId, toGroupPermissionId } from "@/lib/convexTypes";
import { useMutation, useQuery } from "convex/react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PermissionCheckboxGroup } from "./PermissionCheckboxGroup";
import { PermissionsList } from "./PermissionsList";
import { Plus } from "lucide-react";
import { ResourceTypeSelector } from "./ResourceTypeSelector";
import { api } from "@convex/api";
import { useState } from "react";

type Permission = "view" | "create" | "edit" | "delete";
type ResourceType = "tags" | "timeblocks";

interface GroupPermissionsDialogProps {
  groupId: string;
  groupName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function GroupPermissionsDialog({
  groupId,
  groupName,
  isOpen,
  onClose,
}: GroupPermissionsDialogProps) {
  const [resourceType, setResourceType] = useState<ResourceType>("tags");
  const [resourceId, setResourceId] = useState<string>("*");
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([
    "view",
  ]);

  const groupPermissions = useQuery(api.groups.queries.getGroupPermissions, {
    groupId: toGroupId(groupId),
  });

  const tags = useQuery(api.tags.queries.listTagsByOrg, {});
  const timeblocks = useQuery(api.timeblocks.queries.listTimeblocks, {});

  const addPermission = useMutation(api.groups.mutations.addPermissionToGroup);
  const removePermission = useMutation(
    api.groups.mutations.removePermissionFromGroup,
  );

  const handleAddPermission = async () => {
    try {
      await addPermission({
        groupId: toGroupId(groupId),
        resourceType,
        resourceId,
        permissions: selectedPermissions,
      });
      // Reset form
      setResourceId("*");
      setSelectedPermissions(["view"]);
    } catch (error) {
      console.error("Failed to add permission:", error);
      alert("Failed to add permission. Please try again.");
    }
  };

  const handleRemovePermission = async (permissionId: string) => {
    try {
      await removePermission({
        permissionId: toGroupPermissionId(permissionId),
      });
    } catch (error) {
      console.error("Failed to remove permission:", error);
      alert("Failed to remove permission. Please try again.");
    }
  };

  const resourceOptions =
    resourceType === "tags"
      ? tags?.tags?.map((t: { _id: string; name: string }) => ({
          id: t._id,
          name: t.name,
        })) || []
      : timeblocks?.map((t: { _id: string; title: string }) => ({
          id: t._id,
          name: t.title,
        })) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Permissions for {groupName}</DialogTitle>
          <DialogDescription>
            Manage what resources this group can access
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Permission Section */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium">Add Permission</h3>

            <ResourceTypeSelector
              value={resourceType}
              onChange={(value) => {
                setResourceType(value);
                setResourceId("*");
              }}
            />

            <div className="space-y-2">
              <Label>Resource</Label>
              <Select value={resourceId} onValueChange={setResourceId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">All {resourceType}</SelectItem>
                  {resourceOptions.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      {resource.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <PermissionCheckboxGroup
                permissions={selectedPermissions}
                onChange={setSelectedPermissions}
              />
            </div>

            <Button
              onClick={handleAddPermission}
              disabled={selectedPermissions.length === 0}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Permission
            </Button>
          </div>

          {/* Existing Permissions */}
          <div className="space-y-4">
            <h3 className="font-medium">Current Permissions</h3>
            <PermissionsList
              permissions={groupPermissions || []}
              onRemove={handleRemovePermission}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
