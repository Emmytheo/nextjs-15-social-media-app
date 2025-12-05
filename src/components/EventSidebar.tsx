import { EventWithDetails } from "@/app/(main)/events/[event-id]/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EventSidebarProps {
  event: EventWithDetails;
}

export function EventSidebar({ event }: EventSidebarProps) {
  return (
    <div className="sticky top-[5.25rem] hidden h-fit w-80 flex-none space-y-5 xl:block">
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Info */}
          <div className="space-y-3">
            {event.startDate && (
              <div>
                <h4 className="font-semibold text-sm">Date & Time</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(event.startDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(event.startDate).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {event.endDate && ` - ${new Date(event.endDate).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`}
                </p>
              </div>
            )}

            {event.venue && (
              <div>
                <h4 className="font-semibold text-sm">Venue</h4>
                <p className="text-sm text-muted-foreground">{event.venue}</p>
              </div>
            )}

            {event.location && (
              <div>
                <h4 className="font-semibold text-sm">Location</h4>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </div>
            )}

            {event.address && (
              <div>
                <h4 className="font-semibold text-sm">Address</h4>
                <p className="text-sm text-muted-foreground">{event.address}</p>
              </div>
            )}

            {event.category && (
              <div>
                <h4 className="font-semibold text-sm">Category</h4>
                <p className="text-sm text-muted-foreground">{event.category}</p>
              </div>
            )}
          </div>

          {/* Ticket Info */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm mb-2">Tickets</h4>
            <div className="space-y-2">
              {event.ticketType === "FREE" && (
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
              )}

              {event.ticketType === "PAID" && event.ticketPrice && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-semibold">${event.ticketPrice}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Attendees:</span>
                <span className="font-semibold">{event._count.attendees}</span>
              </div>
            </div>
          </div>

          {/* Organization Info */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm mb-2">Organized by</h4>
            <a
              href={`/organization/${event.organization.id}`}
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <span className="font-medium">{event.organization.name}</span>
            </a>
          </div>

          {/* Action Button */}
          {event.ticketUrl && (
            <div className="border-t pt-4">
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors inline-block text-center font-medium"
              >
                {event.ticketType === "FREE" ? "Register Now" : "Get Tickets"}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional info sections can be added here */}
    </div>
  );
}
