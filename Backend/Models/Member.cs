using System;
using System.Collections.Generic;

namespace Backend.Models
{
    public class Member
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public Guid GroupId { get; set; }
        public Group Group { get; set; }
        public List<Transaction> PaidTransactions { get; set; } = new List<Transaction>();
        public List<TransactionSplit> OwedSplits { get; set; } = new List<TransactionSplit>();
    }
}
