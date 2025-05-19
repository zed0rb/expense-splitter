using System;
using System.Collections.Generic;

namespace Backend.DTOs.Responses
{
    public class GroupResponse
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public MemberResponse Creator { get; set; }
        public List<MemberResponse> Members { get; set; } = new List<MemberResponse>();
    }
}
