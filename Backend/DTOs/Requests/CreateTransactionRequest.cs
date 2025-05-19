using System;
using System.Collections.Generic;

namespace Backend.DTOs.Requests
{
    public class CreateTransactionRequest
    {
        public Guid PaidById { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public Dictionary<Guid, decimal> Splits { get; set; } = new();
    }
}


