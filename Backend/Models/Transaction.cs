using System;
using System.Collections.Generic;

namespace Backend.Models
{
    public class Transaction
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public Guid GroupId { get; set; }
        public Group Group { get; set; }
        public Guid PaidById { get; set; }
        public Member PaidBy { get; set; }
        public List<TransactionSplit> Splits { get; set; } = new List<TransactionSplit>();
    }
}
