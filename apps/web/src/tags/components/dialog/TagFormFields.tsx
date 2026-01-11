import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RESPONSE_TIME_OPTIONS, TAG_COLORS } from "@asksync/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Bell, Volume2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { TagFormData } from "@/tags/model";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

export const Name = ({ form }: { form: UseFormReturn<TagFormData> }) => {
  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input
              placeholder="e.g., Support, Urgent, Design Review"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const Description = ({ form }: { form: UseFormReturn<TagFormData> }) => {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Optional description for this tag..."
              rows={3}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const Color = ({ form }: { form: UseFormReturn<TagFormData> }) => {
  return (
    <FormField
      control={form.control}
      name="color"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Color</FormLabel>
          <FormControl>
            <div className="flex gap-2 flex-wrap">
              {TAG_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    field.value === color
                      ? "border-gray-900 scale-110"
                      : "border-gray-300"
                  } transition-all`}
                  style={{ backgroundColor: color }}
                  onClick={() => field.onChange(color)}
                />
              ))}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const AnswerMode = ({ form }: { form: UseFormReturn<TagFormData> }) => {
  const answerMode = form.watch("answerMode");

  return (
    <FormField
      control={form.control}
      name="answerMode"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Answer Mode</FormLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="on-demand">On-demand</SelectItem>
            </SelectContent>
          </Select>
          <FormDescription>
            {answerMode === "scheduled"
              ? "Questions will be answered during associated timeblocks"
              : "Questions will be answered within the specified response time"}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const ResponseTime = ({
  form,
}: {
  form: UseFormReturn<TagFormData>;
}) => {
  const answerMode = form.watch("answerMode");

  if (answerMode === "scheduled") return null;

  return (
    <FormField
      control={form.control}
      name="responseTimeMinutes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Response Time</FormLabel>
          <Select
            value={field.value?.toString()}
            onValueChange={(value) => field.onChange(Number(value))}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select response time" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {RESPONSE_TIME_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            How quickly questions with this tag should be answered
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const NotificationSettings = ({
  form,
}: {
  form: UseFormReturn<TagFormData>;
}) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="browserNotificationEnabled"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <FormLabel className="text-sm font-medium">
                  Browser Notifications
                </FormLabel>
              </div>
              <FormDescription className="text-xs">
                Show desktop notification for new items
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="soundNotificationEnabled"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <FormLabel className="text-sm font-medium">
                  Sound Notifications
                </FormLabel>
              </div>
              <FormDescription className="text-xs">
                Play sound for new items
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};
