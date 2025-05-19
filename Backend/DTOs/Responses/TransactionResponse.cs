using System;
using System.Collections.Generic;

namespace Backend.DTOs.Responses
{
    public class TransactionResponse
    {
        public Guid Id { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public MemberResponse PaidBy { get; set; }
        public List<SplitDetail> Splits { get; set; } = new List<SplitDetail>();
    }

    public class SplitDetail
    {
        public Guid MemberId { get; set; }
        public string MemberName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal Owes { get; set; }  // How much this member owes
        public decimal GetsBack { get; set; }  // How much this member gets back
    }
}
