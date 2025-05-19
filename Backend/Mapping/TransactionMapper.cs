using Backend.DTOs.Responses;
using Backend.Models;
using System.Linq;

namespace Backend.Mapping
{
    public static class TransactionMapper
    {
        public static TransactionResponse MapToResponse(Transaction transaction)
        {
            return new TransactionResponse
            {
                Id = transaction.Id,
                Description = transaction.Description,
                Amount = transaction.Amount,
                Date = transaction.Date,
                PaidBy = new MemberResponse
                {
                    Id = transaction.PaidBy.Id,
                    Name = transaction.PaidBy.Name,
                    IsCreator = false
                },
                Splits = transaction.Splits.Select(split => new SplitDetail
                {
                    MemberId = split.Member.Id,
                    MemberName = split.Member.Name,
                    Amount = split.Amount,
                    Owes = 0,
                    GetsBack = 0
                }).ToList()
            };
        }
    }
}
