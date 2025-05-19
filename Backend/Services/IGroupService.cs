using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.DTOs.Responses;
using Backend.DTOs.Requests;

namespace Backend.Services
{
    public interface IGroupService
    {
        Task<GroupResponse> CreateGroup(CreateGroupRequest request);
        Task<GroupResponse> GetGroupById(Guid id);
        Task<List<GroupResponse>> GetGroups();
        Task<MemberResponse> AddMember(Guid groupId, AddMemberRequest request);
        Task<bool> RemoveMember(Guid groupId, Guid memberId);
    }
}
