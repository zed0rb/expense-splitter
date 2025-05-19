using System;
using System.Collections.Generic;

namespace Backend.Models
{
    public class Group
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Title { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid CreatorId { get; set; }
        public Member Creator { get; set; }
        public List<Member> Members { get; set; } = new List<Member>();
        public List<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}
