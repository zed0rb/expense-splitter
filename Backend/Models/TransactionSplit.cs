using System;

namespace Backend.Models
{
    public class TransactionSplit
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public decimal Amount { get; set; }
        public Guid TransactionId { get; set; }
        public Transaction Transaction { get; set; }
        public Guid MemberId { get; set; }
        public Member Member { get; set; }
    }
}
