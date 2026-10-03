import * as InquiryService from "../inquiry/inquiry.service.js";

export const createConciergeLead = async (data: any) => {
  return await InquiryService.createInquiry(data);
};

export const getConciergeLeads = async (filters: any) => {
  const result = await InquiryService.getInquiries(filters);
  return { leads: result.data, total: result.total, page: result.page, limit: result.limit };
};

export const updateConciergeLead = async (id: string, data: any) => {
  return await InquiryService.updateInquiry(id, data);
};
