namespace Backend.DTOs.Responses
{
    public class MemberResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsCreator { get; set; }
    }
}
