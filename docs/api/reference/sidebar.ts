import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "api/reference/zooza-api",
    },
    {
      type: "category",
      label: "UNTAGGED",
      items: [
        {
          type: "doc",
          id: "api/reference/request-user-login-token",
          label: "Request user login token\n",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/reference/get-agreement",
          label: "Get agreement",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/reference/information-about-current-user",
          label: "Information about current User",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/reference/list-of-registrations",
          label: "List of registrations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/reference/registration-detail",
          label: "Registration detail",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/reference/list-of-orders",
          label: "List of orders",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/reference/order-detail",
          label: "Order detail",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/reference/get-list-events",
          label: "Get List Events",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/reference/create-new-events",
          label: "Create new events",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/reference/get-event-detail-by-id",
          label: "Get event detail by ID",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/reference/update-event",
          label: "Update event",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/reference/create-new-extra-field",
          label: "Create new extra field",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/reference/update-extra-field",
          label: "Update extra field",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/reference/get-schedules",
          label: "Get schedules",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/reference/events-for-given-date-range",
          label: "Events for given date range",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/reference/registrations",
          label: "Registrations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/reference/get-single-registration",
          label: "Get single registration",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/reference/update-a-registrations-based-on-parameters-sent-in-body",
          label: "Update a registrations, based on parameters sent in BODY",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/reference/get-list-of-courses",
          label: "Get list of courses",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/reference/create-course",
          label: "Create course",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/reference/get-course-detail",
          label: "Get course detail",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/reference/update-course",
          label: "Update course",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/reference/get-list-of-schedules",
          label: "Get list of schedules",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/reference/create-schedule",
          label: "Create schedule",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/reference/update-schedule",
          label: "Update schedule",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/reference/send-email-or-sms",
          label: "Send email or SMS",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/reference/insert-payment",
          label: "Insert payment",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/reference/create-an-invoice-for-customer",
          label: "Create an invoice for customer",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/reference/get-all-customer-invoices",
          label: "Get all customer invoices",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/reference/get-customer-invoice",
          label: "Get Customer invoice",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/reference/get-download-url-for-invoice",
          label: "Get Download URL for invoice",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/reference/get-download-url-for-multiple-invoices-at-once",
          label: "Get Download URL for multiple invoices at once",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/reference/get-places-that-belong-to-a-company",
          label: "Get places that belong to a company",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/reference/list-of-users",
          label: "List of users",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
